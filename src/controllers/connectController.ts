//@ts-nocheck
import type { Request, Response } from "express";

interface OnlineUser {
    connectionId: string;
    category: string;
    inCall: boolean;
}

let onlineUsers: OnlineUser[] = [];

export async function connectController(req: Request, res: Response) {
  try {
    const { connectionId, category } = req.body;
    if (!connectionId || !category) {
      return res.status(400).json({ error: 'Connection Id and category are required' });
    }

    if (onlineUsers.some(user => user.connectionId === connectionId)) {
      return res.status(403).json({ error: 'Connection Id already exists' });
    }

    const newUser: OnlineUser = { connectionId, category, inCall: false };
    onlineUsers.push(newUser);

    const calleeUser = onlineUsers.find(user => 
      user.category === category && 
      user.connectionId !== connectionId && 
      !user.inCall
    );

    if (calleeUser) {
      calleeUser.inCall = true;
      newUser.inCall = true;
    }

    res.json({ calleeId: calleeUser?.connectionId || "" });
    console.log("Online Users: ", onlineUsers);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while connecting' });
  }
}

export async function disconnectController(req: Request, res: Response) {
    try {
      const { connectionId } = req.body;
      if (!connectionId) {
        return res.status(400).json({ error: 'Connection Id is required' });
      }
  
      const userIndex = onlineUsers.findIndex(user => user.connectionId === connectionId);
      
      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const removedUser = onlineUsers.splice(userIndex, 1)[0];
  
      // If the disconnected user was in a call, find and remove their partner
      if (removedUser.inCall) {
        const partnerIndex = onlineUsers.findIndex(user => 
          user.category === removedUser.category && user.inCall
        );
        if (partnerIndex !== -1) {
          onlineUsers.splice(partnerIndex, 1);
        }
      }
  
      res.json({ message: 'User and partner (if in call) disconnected successfully' });
      console.log("Online Users after disconnect: ", onlineUsers);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while disconnecting' });
    }
  }