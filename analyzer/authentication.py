from rest_framework.authentication import SessionAuthentication


class CsrfEnforcedSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication that enforces CSRF validation for all unsafe
    HTTP methods (POST, PUT, PATCH, DELETE), even for unauthenticated requests
    (such as the login endpoint).
    """

    def authenticate(self, request):
        if request.method not in ("GET", "HEAD", "OPTIONS", "TRACE"):
            self.enforce_csrf(request)
        return super().authenticate(request)
