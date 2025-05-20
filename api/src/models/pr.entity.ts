import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({ name: 'prs'})
export class PR {
    @PrimaryGeneratedColumn('uuid') id: string;

    @ManyToOne(() => User, u => u.prs, { onDelete: 'CASCADE' }) user: User;
    
    @Column() lift: string;
    @Column() rep: number;
    @Column('numeric', { precision: 6, scale: 2}) weight: number;
    @Column({ type: 'date' }) date: string;

    @CreateDateColumn({ name: 'created_at'}) createdAt: Date;
    @UpdateDateColumn({ name: 'updated_at'}) updatedAt: Date;
}