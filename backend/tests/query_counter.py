from collections.abc import Callable, Iterator
from contextlib import contextmanager
from typing import Any

from sqlalchemy import Engine, event


class QueryCounter:
    """Counts SQL statements sent to the database. Use it to catch N+1 queries."""

    def __init__(self) -> None:
        self.statements: list[str] = []

    @property
    def count(self) -> int:
        return len(self.statements)

    def _record(self, *args: Any) -> None:
        statement = args[2]
        self.statements.append(statement)

    @contextmanager
    def measure(self) -> Iterator[Callable[[], int]]:
        """Yields a function returning how many queries ran inside the block."""
        start = self.count
        end: int | None = None

        def queries_in_block() -> int:
            return (self.count if end is None else end) - start

        yield queries_in_block
        end = self.count

    @classmethod
    @contextmanager
    def listen(cls, engine: Engine) -> Iterator["QueryCounter"]:
        counter = cls()
        event.listen(engine, "before_cursor_execute", counter._record)
        try:
            yield counter
        finally:
            event.remove(engine, "before_cursor_execute", counter._record)
