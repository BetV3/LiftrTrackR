import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Workout } from './workout.entity';
import { PR } from './pr.entity';

@Entity({ name: 'gyms' })
export class Gym {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column() name: string;
    @Column() address: string;
    @Column('numeric', { precision: 10, scale: 6 }) latitude: number;
    @Column('numeric', { precision: 10, scale: 6 }) longitude: number;
    
    @Column({ nullable: true }) placeId: string;
    @Column({ nullable: true }) photoReference: string;
    
    @OneToMany(() => Workout, w => w.gym) workouts: Workout[];
    @OneToMany(() => PR, pr => pr.gym) prs: PR[];

    @CreateDateColumn({ name: 'created_at'}) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at'}) updatedAt: Date;
} 