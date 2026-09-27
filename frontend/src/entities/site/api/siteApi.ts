import { apiFetch } from '@/shared/api'
import { camelizeKeys, snakeizeKeys } from '@/shared/lib'

import type {
  AdminSection,
  AdminSectionDto,
  CustomSectionType,
  SectionContentMap,
  SectionType,
  Site,
  SiteDto,
  SiteSettings,
  SiteSettingsDto,
  Theme,
  ThemeDto,
} from '../model/types'

const SITE_PATH = '/site'
const ADMIN_SETTINGS_PATH = '/admin/site/settings'
const ADMIN_THEME_PATH = '/admin/site/theme'
const ADMIN_SECTIONS_PATH = '/admin/site/sections'
const AUTH = { auth: true } as const

function json(method: string, body: unknown): RequestInit {
  return { method, body: JSON.stringify(body) }
}

function sectionPath(id: number, action?: string): string {
  return action ? `${ADMIN_SECTIONS_PATH}/${id}/${action}` : `${ADMIN_SECTIONS_PATH}/${id}`
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

export async function fetchAdminTheme(): Promise<Theme> {
  return camelizeKeys(await apiFetch<ThemeDto>(ADMIN_THEME_PATH, undefined, AUTH))
}

export async function updateTheme(theme: Theme): Promise<Theme> {
  return camelizeKeys(await apiFetch<ThemeDto>(ADMIN_THEME_PATH, json('PUT', snakeizeKeys(theme)), AUTH))
}

export async function fetchAdminSections(): Promise<AdminSection[]> {
  return camelizeKeys(await apiFetch<AdminSectionDto[]>(ADMIN_SECTIONS_PATH, undefined, AUTH))
}

export async function updateSectionContent<T extends SectionType>(
  id: number,
  content: SectionContentMap[T],
): Promise<AdminSection> {
  const saved = await apiFetch<AdminSectionDto>(sectionPath(id, 'content'), json('PUT', snakeizeKeys(content)), AUTH)
  return camelizeKeys(saved)
}

export async function setSectionVisibility(id: number, isVisible: boolean): Promise<AdminSection> {
  const saved = await apiFetch<AdminSectionDto>(
    sectionPath(id, 'visibility'),
    json('PATCH', { is_visible: isVisible }),
    AUTH,
  )
  return camelizeKeys(saved)
}

export async function reorderSections(ids: number[]): Promise<AdminSection[]> {
  const saved = await apiFetch<AdminSectionDto[]>(`${ADMIN_SECTIONS_PATH}/order`, json('PUT', { ids }), AUTH)
  return camelizeKeys(saved)
}

export async function addSection(type: CustomSectionType): Promise<AdminSection> {
  return camelizeKeys(await apiFetch<AdminSectionDto>(ADMIN_SECTIONS_PATH, json('POST', { type }), AUTH))
}

export async function deleteSection(id: number): Promise<void> {
  await apiFetch<void>(sectionPath(id), { method: 'DELETE' }, AUTH)
}
