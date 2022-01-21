import { useState } from "react"
import { CostTemplates } from "../utils/data-cache"
import { CostTemplate } from "../utils/types"
import { getCostsFromTemplate } from "../utils/utils"
import styles from "../pages/style.module.css"
import { MaterialCost } from "./Material"

export function FullAscensionCosts({ template, costTemplates }: { template: CostTemplate, costTemplates: CostTemplates }) {
  const [expanded, setExpanded] = useState(false)
  const costs = getCostsFromTemplate(template, costTemplates)

  return <>
    <h3 className="text-lg font-bold pt-1" id="ascensions">Ascensions:</h3>
    <table className={`table-auto w-full ${styles.table} mb-2 ${expanded ? "" : "cursor-pointer"} sm:text-sm md:text-base text-xs`} onClick={(e) => setExpanded(true)}>
      <thead>
        <tr className="divide-x divide-gray-200 dark:divide-gray-500">
          <th>Asc.</th>
          <th>Mora</th>
          <th colSpan={costs[costs.length - 1].items.length}>Items</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {costs
          .slice(1)
          .map(({ mora, items }, ind) => {
            let newItems = items
            if (ind == 0 && template.mapping.BossMat)
              newItems = [items[0], { name: "", count: 0 }, ...items.slice(1)]
            return <tr className="pr-1 divide-x divide-gray-200 dark:divide-gray-500" key={ind}>
              <td>A{ind + 1}</td>
              <td className="text-right">{mora}</td>
              {newItems.map(({ count, name }) => <td key={name}>
                {count > 0 && <MaterialCost name={name} count={count} />}
              </td>)}
            </tr>
          })
          .filter((_, i, arr) => expanded ? true : (i == arr.length - 1))}
        {!expanded && <tr className="pr-1 cursor-pointer text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400 no-underline transition-all duration-200 font-semibold">
          <td colSpan={costs[costs.length - 1].items.length + 2} style={({ textAlign: "center" })}>Click to expand...</td>
        </tr>}
      </tbody>
    </table>
  </>
}
