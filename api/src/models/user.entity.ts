import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Workout } from './workout.entity';
import { PR } from './pr.entity';
import { Alert } from './alert.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column({ unique: true}) email: string;
    @Column({ name: 'password_hash'}) passwordHash: string;

    @OneToMany(() => Workout, w => w.user) workouts: Workout[];
    @OneToMany(() => PR, pr => pr.user) prs: PR[];
    @OneToMany(() => Alert, a => a.user) alerts: Alert[];

    @CreateDateColumn({ name: 'created_at'}) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at'}) updatedAt: Date;
}