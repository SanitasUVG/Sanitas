import type {
  BaseClientOptions,
  SchemaInference,
  XataRecord,
} from "@xata.io/client";
declare const tables: readonly [
  {
    readonly name: "Paciente";
    readonly columns: readonly [
      {
        readonly name: "nombre";
        readonly type: "string";
        readonly notNull: true;
        readonly defaultValue: '""';
      }
    ];
  }
];
export type SchemaTables = typeof tables;
export type InferredTypes = SchemaInference<SchemaTables>;
export type Paciente = InferredTypes["Paciente"];
export type PacienteRecord = Paciente & XataRecord;
export type DatabaseSchema = {
  Paciente: PacienteRecord;
};
declare const DatabaseClient: any;
export declare class XataClient extends DatabaseClient<DatabaseSchema> {
  constructor(options?: BaseClientOptions);
}
export declare const getXataClient: () => XataClient;
export {};
