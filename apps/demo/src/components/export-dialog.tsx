"use client"

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@abacus/ui"
import { Download } from "lucide-react"

export function ExportDialog({ rowCount }: { rowCount: number }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <Download />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Export transactions</DialogTitle>
        <DialogDescription>
          {rowCount.toLocaleString("en-GB")} rows match the current filters. The export uses the
          same sort order as the table.
        </DialogDescription>
        <form
          className="mt-400 flex flex-col gap-400"
          onSubmit={(event) => {
            event.preventDefault()
          }}
        >
          <Field label="File name" required description="Without the extension.">
            <Input defaultValue="transactions-2026-09" />
          </Field>
          <Field label="Format">
            <Select defaultValue="csv">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (UTF-8)</SelectItem>
                <SelectItem value="xlsx">Excel workbook</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit">Export {rowCount.toLocaleString("en-GB")} rows</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
