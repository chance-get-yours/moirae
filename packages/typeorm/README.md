# @moirae/typeorm

A Moirae plugin leveraging a SQL database providing:
- EventStore: entity model for the database table
- TypeORMStore: overriding the default `EVENT_STORE` token

- KeyValue: entity model for a key-value cache
- SetRoot/SetValue: entity models for a set cache
- TypeORMCache: overriding the default `CACHE` token

## Compatibility
The following have been tested with Moirae and are known to be compatible.
- [x] sqlite3
- [x] postgresql

## Usage
When using this module, it's required to explicitly import `TypeOrmModule.forFeature(<EntityArr>)` into the Moirae config. The `<EntityArr>` should contain:
- The `EventStore` entity if using TypeORM as an event store
- The `CACHE_ENTITIES` array if using TypeORM as a cache

The TypeORM plugin may be used as an event store, a cache, or both.

```ts
MoiraeModule.forRootAsync({
    cache: {
        type: "typeorm",
    },
    imports: [TypeOrmModule.forFeature([EventStore, CACHE_ENTITIES])],
    store: {
        type: "typeorm",
    }
})
