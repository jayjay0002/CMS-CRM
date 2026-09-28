// Fades a layer of the popcorn cart in or out with its light switch.
export function lightClass(isVisible: boolean): string {
  return `transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`
}
