import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Table from '../Table.vue'
import TableHeader from '../TableHeader.vue'
import TableBody from '../TableBody.vue'
import TableRow from '../TableRow.vue'
import TableHead from '../TableHead.vue'
import TableCell from '../TableCell.vue'

describe('Table', () => {
  it('renders a semantic table structure with header and body rows', () => {
    const wrapper = mount({
      components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell },
      template: `
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Push Day</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      `,
    })

    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.find('thead th').text()).toBe('Name')
    expect(wrapper.find('tbody td').text()).toBe('Push Day')
  })
})
