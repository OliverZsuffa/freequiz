import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
describe('Freequiz',()=>{it('shows dashboard and demo library',()=>{render(<App/>);expect(screen.getByText('Good to have you here.')).toBeInTheDocument();expect(screen.getAllByText('Mathematics').length).toBeGreaterThan(0)});it('opens import assistant',()=>{render(<App/>);fireEvent.click(screen.getAllByRole('button',{name:/Import assistant/i})[0]);expect(screen.getByText('Import JSON')).toBeInTheDocument();expect(screen.getByText('Ask your AI')).toBeInTheDocument()})})
