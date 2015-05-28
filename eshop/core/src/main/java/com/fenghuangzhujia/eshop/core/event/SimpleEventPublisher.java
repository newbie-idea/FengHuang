package com.fenghuangzhujia.eshop.core.event;

import java.util.List;

import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fenghuangzhujia.eshop.core.event.core.EventHandlerDef;
import com.fenghuangzhujia.eshop.core.event.core.EventPublisher;
import com.fenghuangzhujia.eshop.core.event.core.ServiceEvent;

@Service
@Transactional
public class SimpleEventPublisher implements EventPublisher {
	
	private static Logger logger=LoggerFactory.getLogger(SimpleEventPublisher.class);
	
	@Autowired
	private List<EventHandlerDef> defs;
	
	@Override
	public List<EventHandlerDef> getDefs() {
		return this.defs;
	}
	
	@Override
	public void publish(ServiceEvent event) {
		//多线程异步事件处理，防止阻塞应用
		Thread thread=new Thread(new Runnable() {			
			@Override
			public void run() {
				try {
					pub(event);
				} catch (Exception e) {
					logger.error(e.getMessage(), e);
				}
			}
		});
		thread.start();
	}
	
	/**
	 * 实际的处理器
	 * @param event
	 */
	protected void pub(ServiceEvent event) {
		for (EventHandlerDef def : defs) {
			if(def.support(event)) {
				def.handle(event);
			}
		}
	}
}
