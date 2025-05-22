import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Gym } from "./gym.entity";

@Entity({ name: 'prs'})
export class PR {
    @PrimaryGeneratedColumn('uuid') id: string;

    @ManyToOne(() => User, u => u.prs, { onDelete: 'CASCADE' }) user: User;
    
    @ManyToOne(() => Gym, g => g.prs, { nullable: true }) gym: Gym;
    
    @Column() lift: string;
    @Column() rep: number;
    @Column('numeric', { precision: 6, scale: 2}) weight: number;
    @Column({ type: 'date' }) date: string;

    @CreateDateColumn({ name: 'created_at'}) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at'}) updatedAt: Date;
}