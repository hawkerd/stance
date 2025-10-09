from sqlalchemy.orm import Session
from app.database.models.tag import Tag, TagType
from app.database.connect import SessionLocal

def create_tag(db: Session, name: str, tag_type: int) -> Tag:
	tag = Tag(name=name, tag_type=tag_type)
	db.add(tag)
	db.commit()
	db.refresh(tag)
	return tag

def get_tag(db: Session, tag_id: int) -> Tag:
	return db.query(Tag).filter(Tag.id == tag_id).first()

def get_tags(db: Session, skip: int = 0, limit: int = 100):
	return db.query(Tag).offset(skip).limit(limit).all()

def update_tag(db: Session, tag_id: int, name: str = None, tag_type: int = None) -> Tag:
	tag = db.query(Tag).filter(Tag.id == tag_id).first()
	if not tag:
		return None
	if name is not None:
		tag.name = name
	if tag_type is not None:
		tag.tag_type = tag_type
	db.commit()
	db.refresh(tag)
	return tag

def delete_tag(db: Session, tag_id: int) -> bool:
	tag = db.query(Tag).filter(Tag.id == tag_id).first()
	if not tag:
		return False
	db.delete(tag)
	db.commit()
	return True

def find_tag(db: Session, name: str, tag_type: int) -> Tag:
	return db.query(Tag).filter(Tag.name == name, Tag.tag_type == tag_type).first()