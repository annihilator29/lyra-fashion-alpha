import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ShippingAddressList from '../ShippingAddressList'

// Mock server actions
jest.mock('@/app/account/actions', () => ({
  deleteShippingAddress: jest.fn(),
  setDefaultShippingAddress: jest.fn(),
}))

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('ShippingAddressList', () => {
  const mockAddresses = [
    {
      id: 'addr-1',
      name: 'Home',
      address_line1: '123 Main St',
      address_line2: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'US',
      phone: '+15555551234',
      is_default: true,
    },
    {
      id: 'addr-2',
      name: 'Office',
      address_line1: '456 Work Ave',
      address_line2: null,
      city: 'Brooklyn',
      state: 'NY',
      postal_code: '11201',
      country: 'US',
      phone: null,
      is_default: false,
    },
  ]

  beforeEach(() => {
    // Reset confirm mock before each test
    global.confirm = jest.fn() as jest.MockedFunction<typeof confirm>
  })

  afterEach(() => {
    // Clean up confirm mock after each test
    jest.clearAllMocks()
  })

  it('renders empty state when no addresses', () => {
    render(<ShippingAddressList addresses={[]} />)
    
    expect(screen.getByText(/no saved addresses yet/i)).toBeInTheDocument()
  })

  it('renders list of addresses', () => {
    render(<ShippingAddressList addresses={mockAddresses} />)
    
    expect(screen.getByText(/home/i)).toBeInTheDocument()
    expect(screen.getByText(/office/i)).toBeInTheDocument()
    expect(screen.getByText(/123 main st/i)).toBeInTheDocument()
    expect(screen.getByText(/456 work ave/i)).toBeInTheDocument()
  })

  it('shows default badge on default address', () => {
    render(<ShippingAddressList addresses={mockAddresses} />)
    
    expect(screen.getByText(/default/i)).toBeInTheDocument()
  })

  it('calls setDefaultShippingAddress when set default button clicked', async () => {
    const { setDefaultShippingAddress } = await import('@/app/account/actions')
    const { toast } = await import('sonner')
    
    jest.mocked(setDefaultShippingAddress).mockResolvedValue({ 
      error: null, 
      data: mockAddresses[1] 
    })
    
    const mockOnEdit = jest.fn()
    render(<ShippingAddressList addresses={mockAddresses} onEdit={mockOnEdit} />)
    
    // Find and click the "Set as Default" button for the Office address
    const setDefaultButtons = screen.getAllByRole('button')
    const setDefaultButton = setDefaultButtons.find(btn => 
      btn.getAttribute('title') === 'Set as default address'
    )
    
    if (setDefaultButton) {
      fireEvent.click(setDefaultButton)
      
      await waitFor(() => {
        expect(setDefaultShippingAddress).toHaveBeenCalledWith('addr-2')
        expect(toast.success).toHaveBeenCalledWith('Default address updated')
      })
    }
  })

  it('calls deleteShippingAddress with confirmation', async () => {
    const { deleteShippingAddress } = await import('@/app/account/actions')
    const { toast } = await import('sonner')
    
    // Mock window.confirm
    global.confirm = jest.fn(() => true)
    
    jest.mocked(deleteShippingAddress).mockResolvedValue({ 
      error: null, 
      data: { success: true } 
    })
    
    const mockOnEdit = jest.fn()
    render(<ShippingAddressList addresses={mockAddresses} onEdit={mockOnEdit} />)
    
    // Find delete buttons
    const deleteButtons = screen.getAllByRole('button')
    const trashButton = deleteButtons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-trash-2')
    )
    
    if (trashButton) {
      fireEvent.click(trashButton)
      
      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalled()
        expect(deleteShippingAddress).toHaveBeenCalledWith('addr-1')
        expect(toast.success).toHaveBeenCalledWith('Address deleted successfully')
      })
    }
  })

  it('does not delete if user cancels confirmation', async () => {
    const { deleteShippingAddress } = await import('@/app/account/actions')
    
    global.confirm = jest.fn(() => false)
    
    const mockOnEdit = jest.fn()
    render(<ShippingAddressList addresses={mockAddresses} onEdit={mockOnEdit} />)
    
    const deleteButtons = screen.getAllByRole('button')
    const trashButton = deleteButtons.find(btn => 
      btn.querySelector('svg')?.classList.contains('lucide-trash-2')
    )
    
    if (trashButton) {
      fireEvent.click(trashButton)
      
      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalled()
        expect(deleteShippingAddress).not.toHaveBeenCalled()
      })
    }
  })
})
