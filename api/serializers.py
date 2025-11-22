from django.contrib.auth.hashers import make_password, check_password
from rest_framework import serializers
from .models import Member


class MessageSerializer(serializers.Serializer):
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
