import base64
from app.service.storage import upload_image_to_storage
import json


def process_stance_content_json(content_json: str) -> tuple[str, list[str]]:
    image_urls: list[str] = []

    def process_node(node):
        if not isinstance(node, dict):
            return node
        # Process image nodes
        if node.get("type") == "image" and "attrs" in node and "src" in node["attrs"]:
            src = node["attrs"]["src"]
            if src.startswith("data:image/"):
                header, base64_data = src.split(",", 1)
                image_data = base64.b64decode(base64_data)
                image_url = upload_image_to_storage(
                    image_data, content_type=header.split(":")[1].split(";")[0]
                )
                image_urls.append(image_url)
                node["attrs"]["src"] = image_url
        # Recursively process children
        if "content" in node and isinstance(node["content"], list):
            node["content"] = [process_node(child) for child in node["content"]]
        return node

    content_dict = json.loads(content_json)
    if "content" in content_dict and isinstance(content_dict["content"], list):
        content_dict["content"] = [
            process_node(child) for child in content_dict["content"]
        ]
    response = json.dumps(content_dict)
    return response, image_urls
