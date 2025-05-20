import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'alerts' })
export class Alert {
    @PrimaryGeneratedColumn('uuid') id: string;

    @ManyToOne(() => User, u => u.alerts, {onDelete: 'CASCADE' }) user: User;

    @Column() lift: string;
    @Column({ name: 'weeks_stalled' }) weeksStalled: number;
    @Column() status: string;
    @Column({ name: 'suggested_routine', type: 'jsonb' }) suggestedRoutine: any;

    @CreateDateColumn({ name: 'created_at'}) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at'}) updatedAt: Date;
}
