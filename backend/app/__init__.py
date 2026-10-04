from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db, jwt, socketio
from .routes import analytics, auth, chat, parts, prediction, vehicles


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    CORS(
        app,
        resources={r"/*": {"origins": app.config["FRONTEND_ORIGIN"]}},
        supports_credentials=True,
    )
    db.init_app(app)
    jwt.init_app(app)
    socketio.init_app(
        app,
        cors_allowed_origins=app.config["FRONTEND_ORIGIN"],
        async_mode="eventlet",
    )

    for blueprint in (
        auth.bp,
        vehicles.bp,
        prediction.bp,
        parts.bp,
        analytics.bp,
        chat.bp,
    ):
        app.register_blueprint(blueprint)

    @app.get("/health")
    @app.get("/api/health")
    def health_check():
        return {"status": "ok", "service": "smart-used-vehicle-marketplace"}

    with app.app_context():
        db.create_all()

    return app
