import { defineStore } from 'pinia';
import { ref } from 'vue';
export const useNotificationStore = defineStore('notification', () => {
    const message = ref('');
    const type = ref('success');
    let timer = null;
    const announce = (msg, msgType = 'success', duration = 4000) => {
        if (timer)
            clearTimeout(timer);
        // Clear first so the same message can be re-announced
        message.value = '';
        // rAF ensures the DOM registers the empty state before the new message
        requestAnimationFrame(() => {
            message.value = msg;
            type.value = msgType;
            if (duration > 0) {
                timer = setTimeout(() => {
                    message.value = '';
                }, duration);
            }
        });
    };
    return { message, type, announce };
});
