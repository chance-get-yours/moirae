# @moirae/typeorm-store

A Moirae event store leveraging a SQL database providing:
- EventStore: entity model for the database table
- TypeORMStore: overriding the default `EVENT_STORE` token

## Compatibility
The following have been tested with Moirae and are known to be compatible.
- [x] sqlite3

## Usage
When using this module, it's required to explicitly import `TypeOrmModule.forFeature([EventStore])` into the Moirae config.

```ts
MoiraeModule.forRootAsync({
    imports: [TypeOrmModule.forFeature([EventStore])],
    store: {
        type: "typeorm",
    }
})
