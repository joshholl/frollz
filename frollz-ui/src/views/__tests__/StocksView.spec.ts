// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StocksView from '@/views/StocksView.vue'
import { stockApi, filmFormatApi, tagApi, stockTagApi } from '@/services/api-client'
import { Process, FormFactor } from '@/types'

// Mock the API modules
vi.mock('@/services/api-client', () => ({
  stockApi: {
    getAll: vi.fn(),
    createMultipleFormats: vi.fn(),
    getBrands: vi.fn(),
    getManufacturers: vi.fn(),
    getSpeeds: vi.fn(),
  },
  filmFormatApi: {
    getAll: vi.fn(),
  },
  tagApi: {
    getAll: vi.fn(),
  },
  stockTagApi: {
    getAll: vi.fn(),
    create: vi.fn(),
  },
}))

describe('StocksView', () => {
  const mockFormats = [
    { _key: '35mm', format: '35mm', formFactor: 'Roll' },
    { _key: '120', format: '120', formFactor: 'Roll' },
    { _key: 'i-type', format: 'I-Type', formFactor: 'Instant' },
    { _key: '600', format: '600', formFactor: 'Instant' },
  ]

  const mockStocks = [
    {
      _key: 'kodak-portra-400-400-35mm',
      brand: 'Portra 400',
      manufacturer: 'Kodak',
      format: '35mm', 
      process: Process.C_41,
      speed: 400,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock returns
    vi.mocked(stockApi.getAll).mockResolvedValue({ data: mockStocks } as any)
    vi.mocked(filmFormatApi.getAll).mockResolvedValue({ data: mockFormats } as any)
    vi.mocked(tagApi.getAll).mockResolvedValue({ data: [] } as any)
    vi.mocked(stockTagApi.getAll).mockResolvedValue({ data: [] } as any)
    vi.mocked(stockApi.getBrands).mockResolvedValue({ data: [] } as any)
    vi.mocked(stockApi.getManufacturers).mockResolvedValue({ data: [] } as any)
    vi.mocked(stockApi.getSpeeds).mockResolvedValue({ data: [] } as any)
  })

  describe('component mounting', () => {
    it('should mount successfully and load data', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      expect(stockApi.getAll).toHaveBeenCalled()
      expect(filmFormatApi.getAll).toHaveBeenCalled()
    })
  })

  describe('format filtering', () => {
    it('should return empty array when no process is selected', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      expect((wrapper.vm as any).filteredFormats).toEqual([])
    })

    it('should return only instant formats when Instant process is selected', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      const vm = wrapper.vm as any
      vm.form.process = Process.INSTANT
      await wrapper.vm.$nextTick()

      expect(vm.filteredFormats.every((f: any) => f.formFactor === FormFactor.INSTANT)).toBe(true)
      expect(vm.filteredFormats).toHaveLength(2)
    })

    it('should return only non-instant formats when a non-instant process is selected', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      const vm = wrapper.vm as any
      vm.form.process = Process.C_41
      await wrapper.vm.$nextTick()

      expect(vm.filteredFormats.every((f: any) => f.formFactor !== FormFactor.INSTANT)).toBe(true)
      expect(vm.filteredFormats).toHaveLength(2)
    })

    it('should clear selected formatKeys when process changes', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      const vm = wrapper.vm as any
      vm.form.process = Process.C_41
      vm.form.formatKeys = ['35mm', '120']
      await wrapper.vm.$nextTick()

      vm.form.process = Process.INSTANT
      await flushPromises()

      expect(vm.form.formatKeys).toEqual([])
    })
  })

  describe('form validation', () => {
    it('should validate format selection in handleSubmit', async () => {
      const wrapper = mount(StocksView)
      const vm = wrapper.vm as any
      
      // Set up form with missing formats
      vm.form = {
        brand: 'Test Brand',
        manufacturer: 'Test Manufacturer',
        formatKeys: [], // Empty formats should trigger validation
        process: Process.C_41,
        speed: 400,
        boxImageUrl: '',
      }

      // Call handleSubmit directly
      await vm.handleSubmit()
      
      // Should set validation error
      expect(vm.error).toContain('Please select at least one format')
    })

    it('should proceed with API call when formats are selected', async () => {
      const mockCreatedStocks = [
        { _key: 'test-manufacturer-test-brand-400-35mm' },
      ]
      
      vi.mocked(stockApi.createMultipleFormats).mockResolvedValue({ 
        data: mockCreatedStocks 
      } as any)

      const wrapper = mount(StocksView)
      const vm = wrapper.vm as any
      
      // Set up valid form
      vm.form = {
        brand: 'Test Brand',
        manufacturer: 'Test Manufacturer',
        formatKeys: ['35mm'],
        process: Process.C_41,
        speed: 400,
        boxImageUrl: '',
      }
      vm.selectedTagKeys = []

      // Call handleSubmit directly
      await vm.handleSubmit()
      
      // Should call the API with correct data
      expect(stockApi.createMultipleFormats).toHaveBeenCalledWith({
        brand: 'Test Brand',
        manufacturer: 'Test Manufacturer',
        formatKeys: ['35mm'],
        process: Process.C_41,
        speed: 400,
      })
    })
  })

  describe('sorting', () => {
    const multiStocks = [
      { _key: 'stock-a', brand: 'Zebra Film', manufacturer: 'Alpha Corp', format: '35mm', process: Process.C_41, speed: 200 },
      { _key: 'stock-b', brand: 'Alpha Film', manufacturer: 'Zebra Corp', format: '120', process: Process.E_6, speed: 400 },
      { _key: 'stock-c', brand: 'Mango Film', manufacturer: 'Mango Corp', format: 'I-Type', process: Process.INSTANT, speed: 100 },
    ]

    beforeEach(() => {
      vi.mocked(stockApi.getAll).mockResolvedValue({ data: multiStocks } as any)
    })

    it('should default sort by brand ascending', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      const vm = wrapper.vm as any
      expect(vm.sortField).toBe('brand')
      expect(vm.sortDirection).toBe('asc')
      const brands = vm.sortedStocks.map((s: any) => s.brand)
      expect(brands).toEqual(['Alpha Film', 'Mango Film', 'Zebra Film'])
    })

    it('should sort by a different field when setSort is called', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      const vm = wrapper.vm as any
      vm.setSort('manufacturer')
      await wrapper.vm.$nextTick()

      expect(vm.sortField).toBe('manufacturer')
      expect(vm.sortDirection).toBe('asc')
      const manufacturers = vm.sortedStocks.map((s: any) => s.manufacturer)
      expect(manufacturers).toEqual(['Alpha Corp', 'Mango Corp', 'Zebra Corp'])
    })

    it('should toggle sort direction when the same field is clicked again', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      const vm = wrapper.vm as any
      vm.setSort('brand') // already brand/asc, should flip to desc
      await wrapper.vm.$nextTick()

      expect(vm.sortDirection).toBe('desc')
      const brands = vm.sortedStocks.map((s: any) => s.brand)
      expect(brands).toEqual(['Zebra Film', 'Mango Film', 'Alpha Film'])
    })

    it('should reset to ascending when switching to a new field', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      const vm = wrapper.vm as any
      vm.setSort('brand') // flip to desc
      vm.setSort('speed') // new field → should be asc
      await wrapper.vm.$nextTick()

      expect(vm.sortField).toBe('speed')
      expect(vm.sortDirection).toBe('asc')
      const speeds = vm.sortedStocks.map((s: any) => s.speed)
      expect(speeds).toEqual([100, 200, 400])
    })

    it('should sort numerically by speed', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      const vm = wrapper.vm as any
      vm.setSort('speed')
      await wrapper.vm.$nextTick()

      const speeds = vm.sortedStocks.map((s: any) => s.speed)
      expect(speeds).toEqual([100, 200, 400])

      vm.setSort('speed') // desc
      await wrapper.vm.$nextTick()
      expect(vm.sortedStocks.map((s: any) => s.speed)).toEqual([400, 200, 100])
    })

    it('should apply darker background class to active sort column header', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      const vm = wrapper.vm as any
      vm.setSort('manufacturer')
      await wrapper.vm.$nextTick()

      const headers = wrapper.findAll('th')
      const manufacturerHeader = headers[1]
      expect(manufacturerHeader.classes()).toContain('bg-gray-200')
      expect(headers[0].classes()).not.toContain('bg-gray-200')
    })

    it('should show sort direction indicator on active column header', async () => {
      const wrapper = mount(StocksView)
      await flushPromises()

      // Default: brand asc
      const headers = wrapper.findAll('th')
      expect(headers[0].text()).toContain('↑')
      expect(headers[1].text()).not.toMatch(/[↑↓]/)

      const vm = wrapper.vm as any
      vm.setSort('brand') // flip to desc
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('th')[0].text()).toContain('↓')
    })
  })

  describe('multiple format creation', () => {
    it('should call API with multiple format keys', async () => {
      const mockCreatedStocks = [
        { _key: 'test-manufacturer-test-brand-400-35mm' },
        { _key: 'test-manufacturer-test-brand-400-120' },
      ]
      
      vi.mocked(stockApi.createMultipleFormats).mockResolvedValue({ 
        data: mockCreatedStocks 
      } as any)

      const wrapper = mount(StocksView)
      const vm = wrapper.vm as any
      
      // Set up form with multiple formats
      vm.form = {
        brand: 'Test Brand',
        manufacturer: 'Test Manufacturer',
        formatKeys: ['35mm', '120'],
        process: Process.C_41,
        speed: 400,
        boxImageUrl: '',
      }
      vm.selectedTagKeys = []

      await vm.handleSubmit()
      
      expect(stockApi.createMultipleFormats).toHaveBeenCalledWith({
        brand: 'Test Brand',
        manufacturer: 'Test Manufacturer',
        formatKeys: ['35mm', '120'],
        process: Process.C_41,
        speed: 400,
      })
    })

    it('should associate tags with all created stocks', async () => {
      const mockCreatedStocks = [
        { _key: 'stock1' },
        { _key: 'stock2' },
      ]
      
      vi.mocked(stockApi.createMultipleFormats).mockResolvedValue({ 
        data: mockCreatedStocks 
      } as any)

      const wrapper = mount(StocksView)
      const vm = wrapper.vm as any
      
      vm.form = {
        brand: 'Test Brand',
        manufacturer: 'Test Manufacturer',
        formatKeys: ['35mm', '120'],
        process: Process.C_41,
        speed: 400,
        boxImageUrl: '',
      }
      vm.selectedTagKeys = ['tag1', 'tag2']

      await vm.handleSubmit()
      
      // Should create tag associations for all stocks and tags (2 stocks × 2 tags = 4 calls)
      expect(stockTagApi.create).toHaveBeenCalledTimes(4)
      expect(stockTagApi.create).toHaveBeenCalledWith({ stockKey: 'stock1', tagKey: 'tag1' })
      expect(stockTagApi.create).toHaveBeenCalledWith({ stockKey: 'stock1', tagKey: 'tag2' })
      expect(stockTagApi.create).toHaveBeenCalledWith({ stockKey: 'stock2', tagKey: 'tag1' })
      expect(stockTagApi.create).toHaveBeenCalledWith({ stockKey: 'stock2', tagKey: 'tag2' })
    })
  })
})
