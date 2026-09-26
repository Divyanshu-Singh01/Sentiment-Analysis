from django.urls import path
from . import views

urlpatterns = [
    path("api/auth/csrf/", views.get_csrf_token, name="auth_csrf"),
    path("api/auth/signup/", views.signup_view, name="auth_signup"),
    path("api/auth/login/", views.login_view, name="auth_login"),
    path("api/auth/logout/", views.logout_view, name="auth_logout"),
    path("api/auth/me/", views.me_view, name="auth_me"),
    path("api/predict/", views.predict_sentiment, name="predict_sentiment"),
    path("api/history/", views.get_history, name="get_history"),
    path("api/history/clear/", views.clear_history, name="clear_history"),
    path("api/history/<int:history_id>/", views.delete_history_item, name="delete_history_item"),
]
