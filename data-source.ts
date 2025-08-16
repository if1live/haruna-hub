import "reflect-metadata";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { entities } from "./entities/index.js";

/*
typeorm cli를 사용할때 아무 인자나 cli로 넣을 수 없다.
Unknown argument: engine
어쩔수 없이 data source 별로 파일을 나눈다.
*/

const opts = {
  entities,

  // migration 생성 목적으로만 사용할거라 synchronize 비활성화
  synchronize: false,
  logging: false,

  // rdbms에서 테이블 목록 뽑았을때 뒤섞이는거 피하고 싶어서 특수한 이름 사용
  // 쓸 수 있는 prefix는 현실적으로 0 or z 밖에 없고 둘 중에는 0이 나을듯
  // z는 진짜로 테이블 이름에서 사용될지 모르니까
  migrationsTableName: "01_migrations",

  namingStrategy: new SnakeNamingStrategy(),

  migrations: ["migrations/*.ts"],
  subscribers: ["subscribers/*.ts"],
};

export const create_sqlite = () => {
  return new DataSource({
    type: "better-sqlite3",
    database: "sqlite.db",
    ...opts,
  });
};

export const create_mysql = () => {
  return new DataSource({
    type: "mysql",

    host: "localhost",
    port: 3306,
    username: "localhost_dev",
    password: "localhost_dev",
    database: "localhost_dev",

    // mysql options
    charset: "utf8mb4",
    timezone: "+00:00",

    ...opts,
  });
};

const select = (engine: string | undefined) => {
  switch (engine) {
    case "sqlite":
      return create_sqlite();
    case "mysql":
      return create_mysql();
    default:
      throw new Error(`Unknown engine: ${engine}`);
  }
};

export const AppDataSource = select(process.env.ENGINE);
