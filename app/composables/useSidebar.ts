export const useSidebar = () => {
    const sideBarOpen = useState('sideBarOpen', () => false);

    const toggleSidebar = () => {
        sideBarOpen.value = !sideBarOpen.value;
    };

    const closeSidebar = () => {
        sideBarOpen.value = false;
    };

    const openSidebar = () => {
        sideBarOpen.value = true;
    };

    return {
        sideBarOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar
    };
};
