import type { Generated } from "kysely-typeorm";
import type { SnakeCase } from "type-fest";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export type KyselyName = "functionUrl";

const shortName: SnakeCase<KyselyName> = "function_url";
const name = `haruna_${shortName}` as const;

@Entity({ name })
export class MyEntity {
  @PrimaryGeneratedColumn()
  id!: Generated<number>;

  @Column()
  functionArn!: string;

  @Column()
  functionUrl!: string;

  @Column({ type: "simple-json" })
  payload!: unknown;
}
