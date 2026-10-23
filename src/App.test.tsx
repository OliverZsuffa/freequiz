import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
describe('Freequiz',()=>{it('shows dashboard and demo library',()=>{render(<App/>);expect(screen.getByText('Good to have you here.')).toBeInTheDocument();expect(screen.getByText('Mathematics')).toBeInTheDocument()});it('opens import assistant',()=>{render(<App/>);fireEvent.click(screen.getByRole('button',{name:/Import assistant/i}));expect(screen.getByText('Import JSON')).toBeInTheDocument();expect(screen.getByText('Ask your AI')).toBeInTheDocument()})})
