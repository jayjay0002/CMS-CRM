import { apiFetch } from '@/shared/api'
import { camelizeKeys, snakeizeKeys } from '@/shared/lib'

import type {
  AdminSection,
  AdminSectionDto,
  SectionContentMap,
  SectionType,
  Site,
  SiteDto,
  SiteSettings,
  SiteSettingsDto,
} from '../model/types'

const SITE_PATH = '/site'
const ADMIN_SETTINGS_PATH = '/admin/site/settings'
const ADMIN_SECTIONS_PATH = '/admin/site/sections'
const AUTH = { auth: true } as const

function json(method: string, body: unknown): RequestInit {
  return { method, body: JSON.stringify(body) }
}

export async function fetchSite(): Promise<Site> {
  return camelizeKeys(await apiFetch<SiteDto>(SITE_PATH))
}

export async function fetchAdminSiteSettings(): Promise<SiteSettings> {
  return camelizeKeys(await apiFetch<SiteSettingsDto>(ADMIN_SETTINGS_PATH, undefined, AUTH))
}

export async function updateSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
  const saved = await apiFetch<SiteSettingsDto>(ADMIN_SETTINGS_PATH, json('PUT', snakeizeKeys(settings)), AUTH)
  return camelizeKeys(saved)
}

export async function fetchAdminSections(): Promise<AdminSection[]> {
  return camelizeKeys(await apiFetch<AdminSectionDto[]>(ADMIN_SECTIONS_PATH, undefined, AUTH))
}

export async function updateSectionContent<T extends SectionType>(
  type: T,
  content: SectionContentMap[T],
): Promise<AdminSection> {
  const saved = await apiFetch<AdminSectionDto>(
    `${ADMIN_SECTIONS_PATH}/${type}/content`,
    json('PUT', snakeizeKeys(content)),
    AUTH,
  )
  return camelizeKeys(saved)
}

export async function setSectionVisibility(type: SectionType, isVisible: boolean): Promise<AdminSection> {
  const saved = await apiFetch<AdminSectionDto>(
    `${ADMIN_SECTIONS_PATH}/${type}/visibility`,
    json('PATCH', { is_visible: isVisible }),
    AUTH,
  )
  return camelizeKeys(saved)
}

export async function reorderSections(types: SectionType[]): Promise<AdminSection[]> {
  const saved = await apiFetch<AdminSectionDto[]>(`${ADMIN_SECTIONS_PATH}/order`, json('PUT', { types }), AUTH)
  return camelizeKeys(saved)
}
