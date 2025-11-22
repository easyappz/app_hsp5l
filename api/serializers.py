from django.contrib.auth.hashers import make_password, check_password
from rest_framework import serializers
from .models import Member, ChatRoom, Message


class HelloMessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ["id", "nickname", "created_at"]
        read_only_fields = ["id", "created_at"]


class MemberRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, max_length=128)

    class Meta:
        model = Member
        fields = ["id", "nickname", "password", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_nickname(self, value):
        if Member.objects.filter(nickname=value).exists():
            raise serializers.ValidationError("Nickname is already taken.")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data["password"] = make_password(password)
        member = Member.objects.create(**validated_data)
        return member


class MemberLoginSerializer(serializers.Serializer):
    nickname = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        nickname = attrs.get("nickname")
        password = attrs.get("password")
        if not nickname or not password:
            raise serializers.ValidationError("Nickname and password are required.")
        try:
            member = Member.objects.get(nickname=nickname)
        except Member.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials.")
        if not check_password(password, member.password):
            raise serializers.ValidationError("Invalid credentials.")
        attrs["member"] = member
        return attrs


class AuthTokenResponseSerializer(serializers.Serializer):
    token = serializers.CharField()
    member = MemberSerializer()


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ["id", "name"]


class MessageAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ["id", "nickname"]


class MessageSerializer(serializers.ModelSerializer):
    author = MessageAuthorSerializer(read_only=True)
    room_id = serializers.IntegerField(source="room.id", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "text", "created_at", "author", "room_id"]
        read_only_fields = ["id", "created_at", "author", "room_id"]


class MessageCreateSerializer(serializers.Serializer):
    text = serializers.CharField()

    def validate_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Text cannot be empty.")
        return value

    def create(self, validated_data):
        member = self.context["member"]
        room = self.context["room"]
        message = Message.objects.create(
            room=room,
            author=member,
            text=validated_data["text"],
        )
        return message


class ProfileSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(write_only=True, required=False, max_length=128)
    old_password = serializers.CharField(write_only=True, required=False, allow_blank=True, max_length=128)

    class Meta:
        model = Member
        fields = ["id", "nickname", "created_at", "new_password", "old_password"]
        read_only_fields = ["id", "created_at"]

    def validate_nickname(self, value):
        member = self.instance
        queryset = Member.objects.all()
        if member is not None:
            queryset = queryset.exclude(pk=member.pk)
        if queryset.filter(nickname=value).exists():
            raise serializers.ValidationError("Nickname is already taken.")
        return value

    def validate(self, attrs):
        new_password = attrs.get("new_password")
        old_password = attrs.get("old_password")
        member = self.instance
        if new_password is not None and new_password != "":
            if member is None:
                raise serializers.ValidationError({"new_password": "Member instance is required."})
            if old_password is not None and old_password != "":
                if not check_password(old_password, member.password):
                    raise serializers.ValidationError({"old_password": "Old password is incorrect."})
        return attrs

    def update(self, instance, validated_data):
        new_password = validated_data.pop("new_password", None)
        validated_data.pop("old_password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if new_password is not None and new_password != "":
            instance.password = make_password(new_password)
        instance.save()
        return instance
