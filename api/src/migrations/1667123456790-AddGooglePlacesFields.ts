import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddGooglePlacesFields1667123456790 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add placeId column to gyms table
        await queryRunner.addColumn(
            "gyms",
            new TableColumn({
                name: "place_id",
                type: "varchar",
                isNullable: true,
            })
        );

        // Add photoReference column to gyms table
        await queryRunner.addColumn(
            "gyms",
            new TableColumn({
                name: "photo_reference",
                type: "varchar",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop photoReference column
        await queryRunner.dropColumn("gyms", "photo_reference");
        
        // Drop placeId column
        await queryRunner.dropColumn("gyms", "place_id");
    }
} 