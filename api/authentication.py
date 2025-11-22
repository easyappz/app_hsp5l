from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import AuthToken


class TokenAuthentication(BaseAuthentication):
    keyword = "Token"

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None
        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            raise AuthenticationFailed('Invalid Authorization header. Expected value "Token <key>".')
        key = parts[1]
        try:
            token = AuthToken.objects.select_related("member").get(key=key)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed("Invalid token.")
        member = token.member
        request.member = member
        request.auth_token = token
        return member, token
