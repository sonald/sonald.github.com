---
layout: post
title: "nepomuk and fulltext indexing"
date: 2012-04-09 18:04
comments: true
tags: [nepomuk]
---

Just a reminder of some confusing things about Nepomuk in KDE4.

A few of googling tell that it supports fulltext-indexing of variant types of files, 
including pdf file. Unfortunately I failed to witness it in my KDE4 env. So I dig more 
and get some info. 

First newer KDE4 version uses virtuoso to do indexing work instead of old strigi, and 
for pdf-indexing to work, you may need to [install pdftotext][1].  According to [this post][4],
pdf should be supported. To check if a file has been indexed, go to info panel in Dolphin and 
see if there is a 'has hash' property. and here is an [explaination][5] of some parts related to 
Nepomuk infrastructure.

For trouble-shooting, there are some ways to try(see [Nepomuk][2], [re-indexing][3]), 
here are some quick excerpts.

index a file manually from console:
    nepomukindexer /path/to/file

call dbus service to re-indexing a folder(only work for KDE 4.8):
    qdbus org.kde.nepomuk.services.nepomukfileindexer /nepomukfileindexer org.kde.nepomuk.FileIndexer.indexFolder afolder 0 1


[1]: https://bugs.kde.org/show_bug.cgi?id=231936
[2]: http://userbase.kde.org/Nepomuk
[3]: http://trueg.wordpress.com/2011/12/05/manually-forcing-the-re-indexing-of-folders-is-easy/
[4]: http://trueg.wordpress.com/2011/11/02/kde-4-7-3-the-first-nepomuk-stability-release/
[5]: http://trueg.wordpress.com/2011/09/22/about-strigi-soprano-virtuoso-clucene-and-libstreamanalyzer/
