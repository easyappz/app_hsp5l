from django.utils import timezone
import secrets
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AuthToken
from .serializers import (
    MessageSerializer,
    MemberRegistrationSerializer,
    MemberSerializer,
    MemberLoginSerializer,
    AuthTokenResponseSerializer,
)


class HelloView(APIView):
    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
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
