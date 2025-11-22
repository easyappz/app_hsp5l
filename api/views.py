from django.utils import timezone
import secrets
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AuthToken, ChatRoom, Message
from .serializers import (
    HelloMessageSerializer,
    MemberRegistrationSerializer,
    MemberSerializer,
    MemberLoginSerializer,
    AuthTokenResponseSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    ProfileSerializer,
)
from .authentication import TokenAuthentication


class HelloView(APIView):
    @extend_schema(
        responses={200: HelloMessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = HelloMessageSerializer(data)
        return Response(serializer.data)


class RegisterView(APIView):
    @extend_schema(
        responses={201: AuthTokenResponseSerializer},
        description="Register a new member and return token",
    )
    def post(self, request):
        serializer = MemberRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.save()
        token = AuthToken.objects.create(
            member=member, key=secrets.token_hex(20)
        )
        response_data = {
            "token": token.key,
            "member": MemberSerializer(member).data,
        }
        response_serializer = AuthTokenResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    @extend_schema(
        responses={200: AuthTokenResponseSerializer},
        description="Log in an existing member and return token",
    )
    def post(self, request):
        serializer = MemberLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = serializer.validated_data["member"]
        existing_token = (
            AuthToken.objects.filter(member=member)
            .order_by("-created_at")
            .first()
        )
        if existing_token is not None:
            token = existing_token
        else:
            token = AuthToken.objects.create(
                member=member, key=secrets.token_hex(20)
            )
        response_data = {
            "token": token.key,
            "member": MemberSerializer(member).data,
        }
        response_serializer = AuthTokenResponseSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: MemberSerializer},
        description="Get current authenticated member",
    )
    def get(self, request):
        member = request.user
        serializer = MemberSerializer(member)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={204: None},
        description="Logout current authenticated member",
    )
    def post(self, request):
        token = request.auth
        if token is not None:
            token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChatMessageListCreateView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: MessageSerializer},
        description="List messages from the global chat room",
    )
    def get(self, request):
        room, created = ChatRoom.objects.get_or_create(name="Global chat")
        queryset = Message.objects.filter(room=room)
        after_id_param = request.query_params.get("after_id")
        if after_id_param is not None:
            try:
                after_id = int(after_id_param)
                queryset = queryset.filter(id__gt=after_id)
            except ValueError:
                pass
        limit = 50
        limit_param = request.query_params.get("limit")
        if limit_param is not None:
            try:
                value = int(limit_param)
                if value > 0:
                    if value > 200:
                        value = 200
                    limit = value
            except ValueError:
                pass
        queryset = queryset.order_by("created_at")[:limit]
        serializer = MessageSerializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        responses={201: MessageSerializer},
        description="Create a new message in the global chat room",
    )
    def post(self, request):
        room, created = ChatRoom.objects.get_or_create(name="Global chat")
        member = request.user
        serializer = MessageCreateSerializer(
            data=request.data,
            context={"member": member, "room": room},
        )
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        read_serializer = MessageSerializer(message)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


class ProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        responses={200: ProfileSerializer},
        description="Get current authenticated member profile",
    )
    def get(self, request):
        member = request.user
        serializer = ProfileSerializer(member)
        return Response(serializer.data)

    @extend_schema(
        request=ProfileSerializer,
        responses={200: ProfileSerializer},
        description="Update current authenticated member profile",
    )
    def put(self, request):
        member = request.user
        serializer = ProfileSerializer(member, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(
        request=ProfileSerializer,
        responses={200: ProfileSerializer},
        description="Partially update current authenticated member profile",
    )
    def patch(self, request):
        member = request.user
        serializer = ProfileSerializer(member, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
