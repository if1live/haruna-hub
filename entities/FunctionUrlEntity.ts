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

  /** @example "arn:aws:lambda:ap-northeast-1:123456789012:function:ayane-dev-http" */
  @Column({ length: 191, unique: true })
  functionArn!: string;

  /** @example "https://abcdefghijk.lambda-url.ap-northeast-1.on.aws/" */
  @Column({ length: 191, unique: true })
  functionUrl!: string;

  @Column({ type: "simple-json" })
  payload!: unknown;
}
