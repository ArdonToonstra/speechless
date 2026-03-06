import { revalidatePath } from "next/cache"
import { routing } from "@/i18n/routing"

export function revalidateForAllLocales(path: string, type?: 'layout' | 'page') {
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}${path}`, type)
  }
}
