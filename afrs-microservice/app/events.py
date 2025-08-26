"""
RabbitMQ publisher helper.
Publishes minimal event payloads (no raw images).
"""
import json
import pika
from app.config import Config
from app.utils import logger

def publish_event(event_name: str, payload: dict):
    try:
        params = pika.URLParameters(Config.RABBITMQ_URL)
        conn = pika.BlockingConnection(params)
        ch = conn.channel()
        ch.queue_declare(queue="afrs_events", durable=True)
        message = {"event": event_name, "payload": payload}
        ch.basic_publish(exchange="", routing_key="afrs_events", body=json.dumps(message),
                         properties=pika.BasicProperties(delivery_mode=2))
        conn.close()
        logger.info("Published event %s: %s", event_name, payload)
    except Exception as e:
        logger.exception("Failed to publish event: %s", e)
