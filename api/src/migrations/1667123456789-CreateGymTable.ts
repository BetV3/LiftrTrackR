import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateGymTable1667123456789 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create gyms table
        await queryRunner.createTable(
            new Table({
                name: "gyms",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "address",
                        type: "varchar",
                    },
                    {
                        name: "latitude",
                        type: "numeric",
                        precision: 10,
                        scale: 6,
                        isNullable: true,
                    },
                    {
                        name: "longitude",
                        type: "numeric",
                        precision: 10,
                        scale: 6,
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        // Add gym_id column to workouts table
        await queryRunner.addColumn(
            "workouts",
            new Table({
                name: "gym_id",
                type: "uuid",
                isNullable: true,
            })
        );

        // Add foreign key to workouts table
        await queryRunner.createForeignKey(
            "workouts",
            new TableForeignKey({
                columnNames: ["gym_id"],
                referencedTableName: "gyms",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
            })
        );

        // Add gym_id column to prs table
        await queryRunner.addColumn(
            "prs",
            new Table({
                name: "gym_id",
                type: "uuid",
                isNullable: true,
            })
        );

        // Add foreign key to prs table
        await queryRunner.createForeignKey(
            "prs",
            new TableForeignKey({
                columnNames: ["gym_id"],
                referencedTableName: "gyms",
                referencedColumnNames: ["id"],
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        const workoutsForeignKey = (await queryRunner.getTable("workouts"))?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("gym_id") !== -1
        );
        if (workoutsForeignKey) {
            await queryRunner.dropForeignKey("workouts", workoutsForeignKey);
        }

        const prsForeignKey = (await queryRunner.getTable("prs"))?.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("gym_id") !== -1
        );
        if (prsForeignKey) {
            await queryRunner.dropForeignKey("prs", prsForeignKey);
        }

        // Drop columns
        await queryRunner.dropColumn("workouts", "gym_id");
        await queryRunner.dropColumn("prs", "gym_id");

        // Drop gyms table
        await queryRunner.dropTable("gyms");
    }
} 