import { useEffect, useState } from 'react'

type useExternalScriptStatus = 'idle' | 'loading' | 'ready' | 'error'

interface useExternalScriptOptions {
    preventLoad?: boolean
    removeOnUnmount?: boolean
}

const cachedScriptStatus: Record<string, useExternalScriptStatus | undefined> = {}

function getNode(src: string) {
    const node: HTMLScriptElement | null = document.querySelector(`script[src="${src}"]`)

    const status = node?.getAttribute('data-status') as
        | useExternalScriptStatus
        | undefined

    return {
        status,
        node,
    }
}

export function useExternalScript(
    src: string,
    options?: useExternalScriptOptions,
): useExternalScriptStatus {
    const [status, setStatus] = useState<useExternalScriptStatus>(() => {
        if (!src || options?.preventLoad) return 'idle'

        return cachedScriptStatus[src] ?? 'loading'
    })

    useEffect(() => {
        if (!src || options?.preventLoad) return

        //if cached set corresponding status to ready and return

        const cachedStatus = cachedScriptStatus[src]

        if (cachedStatus === 'ready' || cachedStatus === 'error') {
            setStatus(cachedStatus)
            return
        }

        const script = getNode(src)
        let scriptNode = script.node

        if (!scriptNode) {
            scriptNode = document.createElement('script')
            scriptNode.src = src
            scriptNode.async = true
            scriptNode.setAttribute('data-status', 'loading')

            document.body.appendChild(scriptNode)

            const setAttrFromEvent = (e: Event) => {
                const status: useExternalScriptStatus =
                    e.type === 'load' ? 'ready' : 'error'
                scriptNode?.setAttribute('data-status', status)
            }

            scriptNode.addEventListener('load', setAttrFromEvent)
            scriptNode.addEventListener('error', setAttrFromEvent)
        } else {
            setStatus(script.status ?? cachedStatus ?? 'loading')
        }

        const setStateFromEvent = (e: Event) => {
            const status: useExternalScriptStatus = e.type === 'load' ? 'ready' : 'error'
            setStatus(status)
            cachedScriptStatus[src] = status
        }

        scriptNode.addEventListener('load', setStateFromEvent)
        scriptNode.addEventListener('error', setStateFromEvent)

        return () => {
            if (scriptNode) {
                scriptNode.removeEventListener('load', setStateFromEvent)
                scriptNode.removeEventListener('error', setStateFromEvent)
            }

            if (scriptNode && options?.removeOnUnmount) {
                scriptNode.remove()
            }
        }
    }, [src, options?.preventLoad, options?.removeOnUnmount])

    return status
}
