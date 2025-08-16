import type { Generated } from "kysely-typeorm";
import type { SnakeCase } from "type-fest";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type KyselyName = "functionDefinition";

const shortName: SnakeCase<KyselyName> = "function_definition";
const name = `haruna_${shortName}` as const;

@Entity({ name })
export class MyEntity {
  @PrimaryGeneratedColumn()
  id!: Generated<number>;

  @Column({ length: 191 })
  region!: string;

  @Column({ length: 191 })
  functionName!: string;

  @Column({ length: 191, unique: true })
  functionArn!: string;

  @Column({ type: "simple-json" })
  payload!: unknown;
}
