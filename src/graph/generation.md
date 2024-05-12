```mermaid
graph TD;
    books --> generic_bookId[bookId]
    generic_bookId[bookId] --> reviews

    generic_bookId[bookId] --> chapters

    generic_bookId[bookId] --> translations
```