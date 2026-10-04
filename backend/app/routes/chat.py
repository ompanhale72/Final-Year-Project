from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_socketio import emit, join_room

from ..extensions import db, socketio
from ..models import ChatMessage

bp = Blueprint("chat", __name__)


def chat_room(user_a, user_b):
    first, second = sorted([int(user_a), int(user_b)])
    return f"chat:{first}:{second}"


@bp.get("/chat/<int:other_user_id>")
@bp.get("/api/chat/<int:other_user_id>")
@jwt_required()
def chat_history(other_user_id):
    current_user_id = int(get_jwt_identity())
    messages = (
        ChatMessage.query.filter(
            ChatMessage.sender_id.in_([current_user_id, other_user_id]),
            ChatMessage.receiver_id.in_([current_user_id, other_user_id]),
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return {"messages": [message.to_dict() for message in messages]}


@socketio.on("join_chat")
def on_join_chat(data):
    room = chat_room(data["sender_id"], data["receiver_id"])
    join_room(room)
    emit("joined_chat", {"room": room})


@socketio.on("send_message")
def on_send_message(data):
    message = ChatMessage(
        sender_id=int(data["sender_id"]),
        receiver_id=int(data["receiver_id"]),
        vehicle_id=data.get("vehicle_id"),
        message=data["message"],
    )
    db.session.add(message)
    db.session.commit()
    room = chat_room(message.sender_id, message.receiver_id)
    emit("receive_message", message.to_dict(), room=room)
