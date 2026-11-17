export interface UnitDefinition {
    readonly name: string
    readonly symbol: string
    readonly scale: number // to pixel
    readonly halves: boolean // imperial units are divided in halves, metric and other units in tens
}
