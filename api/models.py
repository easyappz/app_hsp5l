from django.db import models


class Member(models.Model):
    nickname = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_authenticated(self):
        return True

    def __str__(self):
        return self.nickname


class AuthToken(models.Model):
    key = models.CharField(max_length=40, unique=True)
    member = models.ForeignKey(Member, related_name="auth_tokens", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.key
