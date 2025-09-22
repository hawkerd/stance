class DefaultError(Exception):
    """A generic error type for application errors."""
    pass

class DatabaseError(DefaultError):
    """An error type for database-related issues."""
    pass
