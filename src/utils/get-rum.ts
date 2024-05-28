interface RumApi {
  getInternalContext(): {
    session_id?: string
    view?: {
      id?: string
      name?: string
    }
  }
}

// TODO: we will change it when it will get integrated into RUM SDK
export function getRum(): RumApi | undefined {
  return (window as any).DD_RUM
}
