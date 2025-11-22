from django.contrib import admin
from .models import Member, AuthToken


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "nickname", "created_at", "updated_at")
    search_fields = ("nickname",)
    ordering = ("-created_at",)


@admin.register(AuthToken)
class AuthTokenAdmin(admin.ModelAdmin):
    list_display = ("key", "member", "created_at")
    search_fields = ("key", "member__nickname")
    ordering = ("-created_at",)
