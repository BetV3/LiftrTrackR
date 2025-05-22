import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Gym } from "./gym.entity";

@Entity({ name: 'workouts' })
export class Workout {
    @PrimaryGeneratedColumn('uuid') id: string;

    @ManyToOne(() => User, u => u.workouts, { onDelete: 'CASCADE'})
    user: User;

    @ManyToOne(() => Gym, g => g.workouts, { nullable: true })
    gym: Gym;
    
    @Column({ type: 'date'}) date: string;
    @Column() lift: string;
    @Column() sets: number;
    @Column() reps: number;
    @Column('numeric', { precision: 6 , scale: 2 }) weight: number;

    @CreateDateColumn({ name: 'created_at'}) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at'}) updatedAt: Date;
}