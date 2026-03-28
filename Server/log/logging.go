package log

import (
	"time"
)

var (
	logs []LogPoint
	currentId LogId = 0
)

type LoggingContext struct {
	source  SourceData
	callers []string
	family  []LogId
}

type LogId uint64

type LogPoint struct {
	Source     SourceData
	CallerName string
	Id         LogId
	Timestamp  time.Time
	Message    string
	Data       any
}

type Relatives struct {
	Parent             LogId
	Children, Relevant []LogId
}

type SourceData struct {
	User,
	ServerName, ServerId,
	CategoryName, CategoryId,
	ChannelName, ChannelId string
}

type Kind int

const (
	KindDebug = 0
	KindInfo  = 1
	KindWarn  = 2
	KindError = 3
)

type Priority int

const (
	PriorityLow      = 0
	PriorityNormal   = 1
	PriorityHigh     = 2
	PriorityVeryHigh = 3
)

func nextId() LogId {
	id := currentId
	currentId++
	return id
}

func (c *LoggingContext) writeLog(priority Priority, kind Kind, message string, data any) {
	lp := LogPoint{
		Source: c.source,
		CallerName: c.callers[len(c.callers)-1],
		Id: nextId(),
	}
	
	logs = append(logs, lp)
}


