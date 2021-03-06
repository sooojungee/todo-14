import { Column } from '@/types/schema'
import { MysqlInsertOrUpdateResult } from '@/types/query'
import { escape } from '../modules/escape'
import express from 'express'
import { query } from '../modules/query'

const router = express.Router()

export type ModifyColumnRequestParams = {
  boardId: number
  columnId: number
}

export type ModifyColumnRequestBody = {
  name: string
  previousColumnId: number
}

router.put('/board/:boardId/column/:columnId', async (req, res) => {
  const { params, body } = req

  const boardId = parseInt(params.boardId)
  const columnId = parseInt(params.columnId)

  const name = body.name
  const previousColumnId = parseInt(body.previousColumnId) || null

  if (
    !boardId ||
    !columnId ||
    !name ||
    (previousColumnId !== null && typeof previousColumnId !== 'number')
  ) {
    res.sendStatus(400)
    return
  }

  // Check if the column belongs to the board
  const [column] = await query<Column[]>(
    `SELECT boardId from \`column\` WHERE id=${columnId}`
  )

  if (column.boardId !== boardId) {
    res.sendStatus(400)
    return
  }

  await query<MysqlInsertOrUpdateResult>(`
    UPDATE \`column\`
    SET
    name=${escape(name)},
    previousColumnId=${escape(previousColumnId)}
    WHERE
    id=${columnId}
  `)

  // TODO: Create an activity after the modification

  res.sendStatus(200)
})

export { router as modifyAColumnRouter }
