"use client"

import { useEffect, useState } from "react";
import { Menu } from "@/lib/types";
import MenuCard from "./MenuCard";
import MenuCardSkeleton from "./MenuCardSkeleton";
import { Tag } from "antd";


export default function UserMenu(){
    const [menus, setMenus] = useState<Menu[]>([]);;
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);


    const deleteMenuAction = async (id: string) => {
        setMessage(null);
        setError(null);

        const res = await fetch(`/api/menu?id=${id}`, { method: "DELETE" });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            setError(data?.error);
            setTimeout(() => setError(null), 5000);
            return;
        }

        setMenus(m => m.filter(menu => menu.id !== id));
        setMessage(data?.message);
        setTimeout(() => setMessage(null), 5000);
    };

    useEffect(() => {
    fetch("/api/menu")
        .then(r => r.json())
        .then(data => setMenus(data.menus));
    }, []);

    if (menus === null ) {
        return (
            <>
            <MenuCardSkeleton></MenuCardSkeleton>
            <MenuCardSkeleton></MenuCardSkeleton>
            <MenuCardSkeleton></MenuCardSkeleton>
            </>
        )
    }

    if(menus.length === 0){
        return <p>No menus saved yet</p>;
    }

    return (
        <>
            {/* feedback messages */}
            {message &&
            <p>
                <Tag color="success" style={{ marginBottom: 12 }}>
                    {message}
                </Tag>
            </p>
            }
            {error && (
                <Tag color="error" style={{ marginBottom: 12 }}>
                {error}
                </Tag>
            )}


            {menus.map(menu => (
               <MenuCard
               key={menu.id}
               menu={menu}
               deleteMenuAction={deleteMenuAction}
               ></MenuCard> 
            ))}

        </>
    )
}